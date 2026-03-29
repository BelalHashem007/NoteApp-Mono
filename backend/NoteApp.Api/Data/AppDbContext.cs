using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using NoteApp.Api.Entities;

namespace NoteApp.Api.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
            
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            //note constraints
            modelBuilder.Entity<Note>()
                .Property(n => n.Id)
                .HasDefaultValueSql("NEWSEQUENTIALID()");

            modelBuilder.Entity<Note>()
                .Property(n => n.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<Note>()
                .Property(n => n.UpdatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<Note>()
                .Property(n => n.Title)
                .HasMaxLength(50)
                .IsRequired();

            //folder constraints
            modelBuilder.Entity<Folder>()
                .Property(f => f.Id)
                .HasDefaultValueSql("NEWSEQUENTIALID()");

            modelBuilder.Entity<Folder>()
                .Property(f => f.FolderName)
                .HasMaxLength(50)
                .IsRequired();

            modelBuilder.Entity<Folder>()
                .Property(f => f.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<Folder>()
                .HasOne(e => e.ParentFolder)
                .WithMany(e => e.Folders)
                .HasForeignKey(e => e.ParentId)
                .IsRequired(false);

            //users constraints
            modelBuilder.Entity<ApplicationUser>()
                .Property(x => x.FullName)
                .HasMaxLength(50);
        }

        public DbSet<Note> Notes { get; set; }
        public DbSet<Folder> Folders { get; set; }
    }
}
